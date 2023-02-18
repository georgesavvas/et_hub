const loadFromLS = name => {
  const data = localStorage.getItem(name);
  return JSON.parse(data);
};

export default loadFromLS;
