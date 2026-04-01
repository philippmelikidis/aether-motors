function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    data,
  });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
}

module.exports = { success, error };
