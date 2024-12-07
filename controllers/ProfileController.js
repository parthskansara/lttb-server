
const getProfile = async(req, res) => {
    const accessToken = req.session.spotify.accessToken; 
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })

    const data = await response.json();
    res.status(200).json(data);

}

export default { getProfile }