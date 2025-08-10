export const generateGroupId = (name) =>
  name.replace(/\s+/g, '-').replace(/[&]/g, 'and').toLowerCase();