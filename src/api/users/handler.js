const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    // validate request
    this._validator.validateUserPayload(request.payload);
    // destructure request
    const { username, password, fullname } = request.payload;
    // add user
    const userId = await this._service.addUser(username, password, fullname);

    const response = h.response({
      status: 'success',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
