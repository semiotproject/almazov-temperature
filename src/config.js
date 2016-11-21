import queryString from 'query-string';
import moment from 'moment';

moment.locale("ru");

let platformHost;
let dateMargin;

const search = queryString.parse(location.search);
if (search.platform) {
    platformHost = decodeURIComponent(search.platform);
} else {
    platformHost = "localhost";
}
if (search.dateMargin) {
    dateMargin = decodeURIComponent(search.dateMargin);
} else {
    dateMargin = 4 * 60 * 60 * 1000; // last hour
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
    observationsStartDate: () => {
        return Date.now() - dateMargin;
    },
    authenticationURL: `https://${platformHost}/auth`,
    observationsTopic: ''
};
