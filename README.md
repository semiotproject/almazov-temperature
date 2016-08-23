## Motivation

This tool was created as a side project for [SemIoT Platform](https://github.com/semiotproject/semiot-platform) - a distributed Internet of Things middleware for collecting, annotating, streaming and analyzing sensor data.
One of the core concepts behind SemIoT platform is Device Driver - OSGI-based software between real-world devices (such as meter or actuators) with any communication protocol and data format and a platform. Core ability of each driver is to convert custom internal device protocol to common platform protocol - providing RDF description of each device and it's observations. So driver's developer should provide a kind of template for this descriptions in driver implementation, which may require a bunch of efforts, especially for developers with little or no experience in Semantic Web technology stack. 

The goal of WoT SemDesc Helper is to provide user-friendly way to generate such descriptions - as our attempt to byte semaphobia phenomenon.

## Implementation

In SemIoT platform we use [SSN](https://www.w3.org/2005/Incubator/ssn/ssnx/ssn) as a core ontology for device and observation descriptions, some other domain-specific ontologies like [MMI](https://www.w3.org/2001/sw/wiki/MMI) and [QUDT](http://www.qudt.org/), and our own extensions.

WoT SemDesc Helper allows to create, first, a device model description that contains information about manufacturer and available sensors, and second - a device instance description, that refers to it's model as a prototype and generate device description and sensor observations templates with user-defined (in form of common programming language string substitution format) placeholders such as observation values and device IDs.

While device instance templates are used to store inside of device drivers, device models are stored centrally in SPARQL endpoint (with exposed Linked Data Interface), so first can be easely dereferenced to second during reasoning. 

## Installation

```
sudo docker pull semiot/wot-semdesc-helper-backend
```

## Launch

```
sudo docker run -itd -p 80:8080 -v /semiot/wot-semdesc-helper/fuseki/:/etc/fuseki/databases/fuseki-db/ -v /semiot/wot-semdesc-helper/config/:/wot_semdesc_helper/backend/ --name semdesc semiot/wot-semdesc-helper-backend
```

If you want to change default configuration, you must create config.properties at /semdesc/config before starting Docker container.

`config.properties` contains:

    fuseki.dataset.url
    fuseki.update.url
    fuseki.username
    fuseki.password
    github.key
    github.secret
    github.callback
	
If any option is not presented in `config.properties`, default setting will be used. 
