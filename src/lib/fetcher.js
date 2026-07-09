import API from './api';

export const fetcher = (url) => API.get(url).then((res) => res.data);
