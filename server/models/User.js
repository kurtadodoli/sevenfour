const bcrypt = require('bcrypt');
const db = require('../config/database').pool;

class User {
    constructor(userData) {
        this.user_id = userData.user_id;
        this.first_name = userData.first_name;
        this.last_name = userData.last_name;
        this.email = userData.email;
        this.password = userData.password;
        this.gender = userData.gender;
        this.birthday = userData.birthday;
        this.role = userData.role || 'user';
    }

    static generateUserId() {
        // Generate a random 8-digit number for the user ID
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async findByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows.length ? new User(rows[0]) : null;
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    }

    static async findById(userId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE user_id = ?',
                [userId]
            );
            return rows.length ? new User(rows[0]) : null;
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    async save() {
        try {
            if (!this.user_id) {
                // New user
                this.user_id = User.generateUserId();
                if (!this.password.startsWith('$2')) { // Check if password is not already hashed
                    this.password = await User.hashPassword(this.password);
                }

                const [result] = await db.execute(
                    `INSERT INTO users (
                        user_id, first_name, last_name, email, password, 
                        gender, birthday, role
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        this.user_id,
                        this.first_name,
                        this.last_name,
                        this.email,
                        this.password,
                        this.gender,
                        this.birthday,
                        this.role
                    ]
                );
                return this.user_id;
            } else {
                // Update existing user
                const [result] = await db.execute(
                    `UPDATE users SET 
                        first_name = ?, 
                        last_name = ?, 
                        email = ?, 
                        gender = ?, 
                        birthday = ?, 
                        role = ?
                    WHERE user_id = ?`,
                    [
                        this.first_name,
                        this.last_name,
                        this.email,
                        this.gender,
                        this.birthday,
                        this.role,
                        this.user_id
                    ]
                );
                return result.affectedRows > 0;
            }
        } catch (error) {
            console.error('Error in save:', error);
            throw error;
        }
    }

    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;