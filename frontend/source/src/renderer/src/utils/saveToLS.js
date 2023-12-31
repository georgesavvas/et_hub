const saveToLS = (name, data) => {
  if (!data || data == null) return;
  localStorage.setItem(name, JSON.stringify(data));
};

export default saveToLS;
