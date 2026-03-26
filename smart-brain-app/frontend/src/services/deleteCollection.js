import axios from 'axios';

export async function deleteCollection(collectionId) {
  const res = await axios.delete(`/api/collections/${collectionId}`);
  return res.data;
}
