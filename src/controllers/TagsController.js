const { response, request } = require('express');
const knex = require('../database/knex');

class TagsController {

  async index(request, response) {
    const {user_id} = request.params;

    const tag = await knex('tags')
    .select("id", 'name', 'note_id')
    .where({user_id});

    return response.json(tag);


}

async delete(request, response) {
  const { id } = request.params;

  const deleteTags = await knex('tags')
    .where({ id })
    .del();

  if (deleteTags === 0) {
    return response.status(404).json({ error: "tag not found" });
  }

  return response.status(204).send();
}


}

module.exports = TagsController;