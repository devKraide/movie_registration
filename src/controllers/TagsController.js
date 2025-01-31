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

async create(request, response) {
  const { name, note_id } = request.body;
  const { user_id } = request.params;

  try {

    const existingTag = await knex('tags')
    .where({ name, note_id, user_id })

    if (!name) {
      return response.status(400).json({ error: 'name is required' });
    }

    if (!note_id) {
      return response.status(400).json({ error: 'note_id is required' });
    }

    if(existingTag.length > 0) {
      return response.status(400).json({ error: 'tag already exists' });
    }

    await knex('tags').insert({
      name,
      note_id,
      user_id
    });

    return response.status(201).send();
  } catch (error) {

    console.error(error);
    return response.status(500).json({ error: 'could not create tag' });
  }
}
}

module.exports = TagsController;