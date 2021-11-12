const baseUrl = 'https://iagimnasio.herokuapp.com/';

export const endpointCall = async (endpoint,data = {},type = 'GET',urlParameters = '') =>{
    const options = {
        method: type,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    try {
        const response = (type !== 'GET') ?  await fetch(baseUrl + endpoint + '/' + urlParameters, options) : 
                            await fetch(baseUrl + endpoint + '/' + urlParameters)
        return response;
    } 
    catch (error) {
		console.error("Oops! Algo salió mal.", error);
        return []
    }
}
