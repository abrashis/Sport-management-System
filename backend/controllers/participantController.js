import pool from '../config/db.js';

export const getDashboardData = async (req, res) => {
    const userId = req.session.userId;
    try {
        // Own registrations
        const [teams] = await pool.execute('SELECT t.*, s.name as sport_name FROM teams t JOIN sports s ON t.sport_id = s.id WHERE t.owner_user_id = ?', [userId]);
        const [single] = await pool.execute('SELECT sr.*, s.name as sport_name FROM single_registrations sr JOIN sports s ON sr.sport_id = s.id WHERE sr.user_id = ?', [userId]);

        // Upcoming published matches for their teams/self
        const teamIds = teams.map(t => t.id);
        const singleIds = single.map(s => s.id);

        let matches = [];
        if (teamIds.length > 0 || singleIds.length > 0) {
            const query = `
                SELECT m.*, s.name as sport_name 
                FROM matches m 
                JOIN sports s ON m.sport_id = s.id 
                WHERE m.published = 1 AND m.is_deleted = 0 AND m.match_datetime >= NOW()
                AND (
                    (m.participant1_type = 'team' AND m.participant1_id IN (${teamIds.length > 0 ? teamIds.join(',') : '-1'})) OR
                    (m.participant2_type = 'team' AND m.participant2_id IN (${teamIds.length > 0 ? teamIds.join(',') : '-1'})) OR
                    (m.participant1_type = 'single' AND m.participant1_id IN (${singleIds.length > 0 ? singleIds.join(',') : '-1'})) OR
                    (m.participant2_type = 'single' AND m.participant2_id IN (${singleIds.length > 0 ? singleIds.join(',') : '-1'}))
                )
                ORDER BY m.match_datetime ASC LIMIT 5`;
            const [rows] = await pool.execute(query);
            matches = rows;
        }

        // Latest notifications
        const [notifications] = await pool.execute('SELECT * FROM notifications WHERE user_id = ? AND sent = 1 ORDER BY created_at DESC LIMIT 3', [userId]);

        res.json({
            registrations: { teams, single },
            upcoming_matches: matches,
            notifications
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const registerSport = async (req, res) => {
    const userId = req.session.userId;
    const { sport_id, type } = req.body; // type: team or single

    try {
        const [sport] = await pool.execute('SELECT * FROM sports WHERE id = ?', [sport_id]);
        if (sport.length === 0) return res.status(404).json({ message: 'Sport not found' });
        if (!sport[0].registration_open) return res.status(400).json({ message: 'Registration closed for this sport' });

        if (type === 'team') {
            const { team_name, captain_name, captain_email, captain_phone, members } = req.body;
            const [result] = await pool.execute(
                'INSERT INTO teams (sport_id, owner_user_id, team_name, captain_name, captain_email, captain_phone) VALUES (?, ?, ?, ?, ?, ?)',
                [sport_id, userId, team_name, captain_name, captain_email, captain_phone]
            );
            const teamId = result.insertId;

            // Insert members
            for (const m of members) {
                await pool.execute(
                    'INSERT INTO team_members (team_id, member_name, section, jersey_number) VALUES (?, ?, ?, ?)',
                    [teamId, m.member_name, m.section, m.jersey_number]
                );
            }
        } else {
            const { player_name, phone } = req.body;
            await pool.execute(
                'INSERT INTO single_registrations (sport_id, user_id, player_name, phone) VALUES (?, ?, ?, ?)',
                [sport_id, userId, player_name, phone]
            );
        }

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTieSheet = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT m.*, s.name as sport_name 
            FROM matches m 
            JOIN sports s ON m.sport_id = s.id 
            WHERE m.published = 1 AND m.is_deleted = 0 
            ORDER BY m.match_datetime ASC`);

        // Enhanced info: join with teams/single names
        const enriched = await Promise.all(rows.map(async (m) => {
            let p1_name = 'TBD';
            let p2_name = 'BYE';

            if (m.participant1_id) {
                const table = m.participant1_type === 'team' ? 'teams' : 'single_registrations';
                const col = m.participant1_type === 'team' ? 'team_name' : 'player_name';
                const [row] = await pool.execute(`SELECT ${col} as name FROM ${table} WHERE id = ?`, [m.participant1_id]);
                if (row.length > 0) p1_name = row[0].name;
            }

            if (m.participant2_id) {
                const table = m.participant2_type === 'team' ? 'teams' : 'single_registrations';
                const col = m.participant2_type === 'team' ? 'team_name' : 'player_name';
                const [row] = await pool.execute(`SELECT ${col} as name FROM ${table} WHERE id = ?`, [m.participant2_id]);
                if (row.length > 0) p2_name = row[0].name;
            } else if (m.participant2_type === 'bye') {
                p2_name = 'BYE';
            }

            return { ...m, p1_name, p2_name };
        }));

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
