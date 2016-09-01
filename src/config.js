const platformHost = "demo.semiot.ru";

export default {
    platformHost,
    baseURL: '/almazov-temperature/',
    systemsURL: `https://${platformHost}/systems?page=1&size=1000`,
    observationsURL: `https://${platformHost}/systems`,
    platformCredentials: {
        user: "root",
        password: "root"
    },
    authenticationURL: `https://${platformHost}/auth`,
    observationsTopic: ''
};
