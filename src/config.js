const platformHost = "test.semiot.ru";

export default {
    platformHost,
    baseURL: '/almazov-temperature/',
    observationsURL: `https://${platformHost}/systems`,
    platformCredentials: {
        user: "root",
        password: "root"
    },
    authenticationURL: `https://${platformHost}/`,
    observationsTopic: ''
};
