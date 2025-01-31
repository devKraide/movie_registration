const knex = require("../database/knex");
const { hash, compare } = require('bcryptjs');
const AppError = require('../utils/AppError')
const sqliteConnection = require("../database/sqlite");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();

    if (!name || !email || !password) {
      throw new AppError("Missing parameters")
    }

    const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (checkUserExists) {
      throw new AppError("Email address already used.")
    }

    const passwordHash = await hash(password, 8);

    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, passwordHash]);

    return response.status(201).json();
  }


  async update(request, response) {
    const { name, email, password, new_password } = request.body
    const { id } = request.params

    const user_id_exists = await knex("users").where({id}).first()

    if (!user_id_exists) {
      return response.status(404).json({ error: "User not found" })
    }

    const database = await sqliteConnection()
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

    if (!user) {
      throw new AppError("user not found", 404)
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) { //it means = if a user  with the email exists, and the id from this email is different from the user id that is being updated, it means that the email is already in use per another person.
      throw new AppError("email already in use")
    }

    if (userWithUpdatedEmail && userWithUpdatedEmail.id === user.id) { 
      throw new AppError("This email is already in use by this user ")
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if(!password){
      throw new AppError("current password is required to update users data")
    }

    if (new_password && !password) {
      throw new AppError("current password is required to update the password")
    }


    if (new_password && password) {
      const checkPassword = await compare(password, user.password)

      if (!checkPassword) {
        throw new AppError("current password is incorrect")
      }

      user.password = await hash(new_password, 8);
    }


    await database.run(`
     UPDATE users SET
     name = ?,
     email = ?,
     password = ?,
     updated_at = DATETIME('now')
     WHERE id = ?`,
      [user.name, user.email, user.password, id]
    )

    return response.status(201).json();
  }
}


module.exports = UsersController