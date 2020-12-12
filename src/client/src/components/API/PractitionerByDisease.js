import axios from 'axios';

export const practitionerByDisease = async (id) => {
    let data = {
        diseaseID: id
    };
    let res;
    try {
        res = await axios.post(`${process.env.REACT_APP_API_ADDR}/patient/appointments/findPractitioner`, data, { withCredentials: true });
        return res.data;
    } catch (error) {
        if (error.response.status === 500) return null;
    }
}