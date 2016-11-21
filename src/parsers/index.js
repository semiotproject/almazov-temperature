import moment from 'moment';

function extractSystemNameFromAPIMessage(msg) {
    return msg['rdfs:label'] ? msg['rdfs:label']['@value'] : msg['@id'];
}

function getIdFromURI(uri) {
    return uri.substring(uri.lastIndexOf('/') + 1);
}

function extractSystemFromAPIMessage(msg, index = -1) {
    return {
        index: index + 1,
        uri: msg['@id'],
        id: msg['dcterms:identifier'],
        name: extractSystemNameFromAPIMessage(msg)
    };
}

export default {
    parseSystems(s) {
        return s['hydra:member'].filter((s) => {
            return s["@type"] === "apidoc:SEMIOTTHSDevice";
        }).map((s, index) => {
            return {
                uri: s['@id']
            }
        });
    },
    parseSystem(s) {
        let temperatureSensor = _.find(s["ssn:hasSubSystem"], (ss) => {
            return ss["proto:hasPrototype"] === "https://raw.githubusercontent.com/semiotproject/semiot-drivers/master/semiot-th-s/src/main/resources/ru/semiot/platform/drivers/semiot_th_s/prototype.ttl#SEMIOTTHSDevice-TemperatureSensor"
        });
        let humiditySensor = _.find(s["ssn:hasSubSystem"], (ss) => {
            return ss["proto:hasPrototype"] === "https://raw.githubusercontent.com/semiotproject/semiot-drivers/master/semiot-th-s/src/main/resources/ru/semiot/platform/drivers/semiot_th_s/prototype.ttl#SEMIOTTHSDevice-HumiditySensor"
        });
        return {
            uri: s["@id"],
            room: s["geo:location"]["http://schema.org/branchCode"],
            temperatureSensorUri: temperatureSensor && temperatureSensor["@id"],
            humiditySensorUri: humiditySensor && humiditySensor["@id"]
        };
    },
    parseSensor(s) {
        return s;
    },
    parseObservation(obs) {
        const parsedObs = {};
        const hydraOperationRoot = obs["hydra-filter:viewOf"] ? obs["hydra-filter:viewOf"] : obs;
        const subscriptionOperation = hydraOperationRoot['hydra:operation'];
        parsedObs.topic = subscriptionOperation['hydra-pubsub:topic'];
        try {
            const entries = obs["hydra:member"].sort((a, b) => { 
                return moment(a["ssn:observationResultTime"]).toDate().getTime() - moment(b["ssn:observationResultTime"]).toDate().getTime() > 0 ? -1 : 1; 
            });
            console.warn(entries);
            parsedObs.value = entries[0]["ssn:observationResult"]["ssn:hasValue"]["qudt:quantityValue"];
            parsedObs.timestamp = moment(entries[0]["ssn:observationResultTime"]).toDate();
            parsedObs.prevValue = entries[1]["ssn:observationResult"]["ssn:hasValue"]["qudt:quantityValue"];
        } catch (e) {
            console.error(e);
        }
        return parsedObs;
    },
    parseObservationFromWamp(obs) {
        return obs;
    }
}