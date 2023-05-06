const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const { mapUserToModel } = require('../utils');

class Usersservice {
  constructor() {
    this._pool = new Pool();
  }

  async addUser(username, password, fullname) {
    // verify if the provided username already exists in the database
    // if it does, throw an InvariantError
    await this.verifyNewUsername(username);

    // if it doesn't, create userId, hash the password
    // and store it in the database
    const userId = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING user_id',
      values: [userId, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].user_id) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows.map(mapUserToModel)[0].userId;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError(
        'Gagal menambahkan user. Username sudah digunakan.'
      );
    }
  }
}

module.exports = Usersservice;
