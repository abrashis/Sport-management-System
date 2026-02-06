import pool from '../config/db.js';
import { createMatchNotifications } from '../services/notificationService.js';

// Stats
export const getDashboardStats = async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "participant"');
        const [sports] = await pool.execute('SELECT COUNT(*) as count FROM sports');
        const [teams] = await pool.execute('SELECT COUNT(*) as count FROM teams');
        const [registrations] = await pool.execute('SELECT COUNT(*) as count FROM single_registrations');

        res.json({
            users: users[0].count,
            sports: sports[0].count,
            total_registrations: teams[0].count + registrations[0].count
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Sports CRUD
export const getSports = async (req, res) => {
    try {
        const [sports] = await pool.execute('SELECT * FROM sports ORDER BY created_at DESC');
        res.json(sports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createSport = async (req, res) => {
    const { name, type, max_players } = req.body;
    try {
        await pool.execute(
            'INSERT INTO sports (name, type, max_players) VALUES (?, ?, ?)',
            [name, type, max_players]
        );
        res.status(201).json({ message: 'Sport created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateSport = async (req, res) => {
    const { id } = req.params;
    const { name, type, max_players, registration_open } = req.body;
    try {
        await pool.execute(
            'UPDATE sports SET name = ?, type = ?, max_players = ?, registration_open = ? WHERE id = ?',
            [name, type, max_players, registration_open, id]
        );
        res.json({ message: 'Sport updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteSport = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM sports WHERE id = ?', [id]);
        res.json({ message: 'Sport deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Registrations
export const getRegistrations = async (req, res) => {
    try {
        const [teams] = await pool.execute(`
            SELECT t.*, s.name as sport_name 
            FROM teams t 
            JOIN sports s ON t.sport_id = s.id 
            ORDER BY t.created_at DESC`);

        const [individuals] = await pool.execute(`
            SELECT sr.*, s.name as sport_name 
            FROM single_registrations sr 
            JOIN sports s ON sr.sport_id = s.id 
            ORDER BY sr.created_at DESC`);

        res.json({ teams, individuals });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateRegistrationStatus = async (req, res) => {
    const { type, id } = req.params; // type: team or single
    const { status } = req.body; // approved, rejected
    try {
        const table = type === 'team' ? 'teams' : 'single_registrations';
        await pool.execute(`UPDATE ${table} SET approved_status = ? WHERE id = ?`, [status, id]);
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Draw / Tie Sheet Generation
export const generateTieSheet = async (req, res) => {
    const { sport_id, round_no, venue, start_datetime, slot_duration } = req.body;
    try {
        // 1. Get sport info
        const [sports] = await pool.execute('SELECT type FROM sports WHERE id = ?', [sport_id]);
        if (sports.length === 0) return res.status(404).json({ message: 'Sport not found' });
        const isTeam = sports[0].type === 'team';

        // 2. Get approved registrations
        let participants = [];
        if (isTeam) {
            const [rows] = await pool.execute('SELECT id, owner_user_id as user_id FROM teams WHERE sport_id = ? AND approved_status = "approved"', [sport_id]);
            participants = rows;
        } else {
            const [rows] = await pool.execute('SELECT id, user_id FROM single_registrations WHERE sport_id = ? AND approved_status = "approved"', [sport_id]);
            participants = rows;
        }

        if (participants.length < 2) return res.status(400).json({ message: 'Not enough approved participants to generate a draw' });

        // 3. Shuffle
        participants.sort(() => Math.random() - 0.5);

        // 4. Create Match pairs
        const matches = [];
        let currentTime = new Date(start_datetime);

        for (let i = 0; i < participants.length; i += 2) {
            const p1 = participants[i];
            const p2 = participants[i + 1];

            const match = {
                sport_id,
                round_no,
                p1_id: p1.id,
                p1_type: isTeam ? 'team' : 'single',
                p2_id: p2 ? p2.id : null,
                p2_type: p2 ? (isTeam ? 'team' : 'single') : 'bye',
                datetime: new Date(currentTime),
                venue
            };

            matches.push(match);
            currentTime.setMinutes(currentTime.getMinutes() + parseInt(slot_duration));
        }

        // 5. Save to DB
        for (const m of matches) {
            const [result] = await pool.execute(
                'INSERT INTO matches (sport_id, round_no, participant1_type, participant1_id, participant2_type, participant2_id, match_datetime, venue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [m.sport_id, m.round_no, m.p1_type, m.p1_id, m.p2_type, m.p2_id, m.datetime, m.venue]
            );

            // 6. Create notifications for the participants
            const matchId = result.insertId;
            const user1_id = participants.find(p => p.id === m.p1_id).user_id;
            const users = [user1_id];
            if (m.p2_id) {
                const user2_id = participants.find(p => p.id === m.p2_id).user_id;
                users.push(user2_id);
            }

            await createMatchNotifications(matchId, users, m.datetime);
        }

        res.json({ message: 'Tie sheet generated and notifications scheduled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMatches = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT m.*, s.name as sport_name 
            FROM matches m 
            JOIN sports s ON m.sport_id = s.id 
            WHERE m.is_deleted = 0 
            ORDER BY m.match_datetime ASC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateMatchVisibility = async (req, res) => {
    const { id } = req.params;
    const { published } = req.body;
    try {
        await pool.execute('UPDATE matches SET published = ? WHERE id = ?', [published ? 1 : 0, id]);
        res.json({ message: published ? 'Match published' : 'Match unpublished' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
