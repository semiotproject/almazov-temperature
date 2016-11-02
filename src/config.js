import queryString from 'query-string';

let platformHost;

const search = queryString.parse(location.search);
if (search.platform) {
    platformHost = decodeURIComponent(search.platform);
} else {
    platformHost = "localhost";
}

export default {
    platformHost,
    baseURL: '/',
    systemsURL: `https://${platformHost}/systems?page=1&size=1000`,
    observationsURL: `https://${platformHost}/systems`,
    platformCredentials: {
        user: "root",
        password: "root"
    },
    authenticationURL: `https://${platformHost}/auth`,
    observationsTopic: ''
};
