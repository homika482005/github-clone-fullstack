const authorizeOwner = (getResource) => {
  return async (req, res, next) => {
    try {
      const resource = await getResource(req);
      if (!resource) {
        return res.status(404).json({ success: false, message: "Resource not found" });
      }

      if (resource.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: You are not the owner" });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = { authorizeOwner };
