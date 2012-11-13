var config = {}


config.mongoLab = {};
config.AD = {};


config.mongoLab.conString = 'mongodb://dbu:alpine66@ds035997.mongolab.com:35997/b_computers';

config.AD.User 	= 'edita\\marvin';
config.AD.Pass	= 'alpine66';
config.AD.Url	= 'ldap://10.40.1.11:389'

module.exports = config;