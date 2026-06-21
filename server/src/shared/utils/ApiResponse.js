class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json(
      new ApiResponse(statusCode, data, message)
    );
  }

  static created(res, data, message = 'Created Successfully') {
    return res.status(201).json(
      new ApiResponse(201, data, message)
    );
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;