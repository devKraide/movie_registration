const express = require("express");

const app = express();

app.get("/message/:id/:user", (request, response) => {
  const {id, user} = request.params;

  response.send(`user name ${user},and id ${id}`);
});

app.get("/users", (request, response) => {
  const {page, limit} = request.query;

  response.send(`Message at page: ${page} and limit: ${limit}`);
});

const PORT = 3333;
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))

