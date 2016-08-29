const platformHost = "test.semiot.ru";

export default {
    platformHost,
    observationsURL: `https://${platformHost}/systems`,
    platformCredentials: {
        user: "root",
        password: "root"
    },
    authenticationURL: `https://${platformHost}/`,
    observationsTopic: ''
};
