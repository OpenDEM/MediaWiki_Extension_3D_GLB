<?php
error_reporting( -1 );
ini_set( 'display_errors', 1 );
# This file was automatically generated by the MediaWiki 1.43.0-alpha
# installer. If you make manual changes, please keep track in case you
# need to recreate them later.
#
# See includes/MainConfigSchema.php for all configurable settings
# and their default values, but don't forget to make changes in _this_
# file, not there.
#
# Further documentation for configuration settings may be found at:
# https://www.mediawiki.org/wiki/Manual:Configuration_settings

# Protect against web entry
if ( !defined( 'MEDIAWIKI' ) ) {
	exit;
}

## Include DevelopmentSettings.php
require_once "$IP/includes/DevelopmentSettings.php";



## Uncomment this to disable output compression
# $wgDisableOutputCompression = true;

$wgSitename = "MediaWiki";
$wgMetaNamespace = "Project";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
## For more information on customizing the URLs
## (like /w/index.php/Page_title to /wiki/Page_title) please see:
## https://www.mediawiki.org/wiki/Manual:Short_URL
$wgScriptPath = "";

## The protocol and server name to use in fully-qualified URLs
$wgServer = "http://localhost:4000";

## The URL path to static resources (images, scripts, etc.)
$wgResourceBasePath = $wgScriptPath;

## The URL paths to the logo.  Make sure you change this from the default,
## or else you'll overwrite your logo when you upgrade!
$wgLogos = [
	'1x' => "$wgResourceBasePath/resources/assets/change-your-logo.svg",
	'icon' => "$wgResourceBasePath/resources/assets/change-your-logo-icon.svg",
];

## UPO means: this is also a user preference option

$wgEnableEmail = true;
$wgEnableUserEmail = true; # UPO

$wgEmergencyContact = "";
$wgPasswordSender = "";

$wgEnotifUserTalk = false; # UPO
$wgEnotifWatchlist = false; # UPO
$wgEmailAuthentication = true;

## Database settings
$wgDBtype = "sqlite";
$wgDBserver = "";
$wgDBname = "my_wiki";
$wgDBuser = "";
$wgDBpassword = "";

# SQLite-specific settings
$wgSQLiteDataDir = "cache/";
$wgObjectCaches[CACHE_DB] = [
	'class' => SqlBagOStuff::class,
	'loggroup' => 'SQLBagOStuff',
	'server' => [
		'type' => 'sqlite',
		'dbname' => 'wikicache',
		'tablePrefix' => '',
		'variables' => [ 'synchronous' => 'NORMAL' ],
		'dbDirectory' => $wgSQLiteDataDir,
		'trxMode' => 'IMMEDIATE',
		'flags' => 0
	]
];
$wgLocalisationCacheConf['storeServer'] = [
	'type' => 'sqlite',
	'dbname' => "{$wgDBname}_l10n_cache",
	'tablePrefix' => '',
	'variables' => [ 'synchronous' => 'NORMAL' ],
	'dbDirectory' => $wgSQLiteDataDir,
	'trxMode' => 'IMMEDIATE',
	'flags' => 0
];
$wgJobTypeConf['default'] = [
	'class' => 'JobQueueDB',
	'claimTTL' => 3600,
	'server' => [
		'type' => 'sqlite',
		'dbname' => "{$wgDBname}_jobqueue",
		'tablePrefix' => '',
		'variables' => [ 'synchronous' => 'NORMAL' ],
		'dbDirectory' => $wgSQLiteDataDir,
		'trxMode' => 'IMMEDIATE',
		'flags' => 0
	]
];
$wgResourceLoaderUseObjectCacheForDeps = true;

# Shared database table
# This has no effect unless $wgSharedDB is also set.
$wgSharedTables[] = "actor";

## Shared memory settings
$wgMainCacheType = CACHE_ACCEL;
$wgMemCachedServers = [];

## To enable image uploads, make sure the 'images' directory
## is writable, then set this to true:
$wgEnableUploads = true;
#$wgUseImageMagick = true;
#$wgImageMagickConvertCommand = "/usr/bin/convert";

# InstantCommons allows wiki to use images from https://commons.wikimedia.org
$wgUseInstantCommons = false;

# Periodically send a pingback to https://www.mediawiki.org/ with basic data
# about this MediaWiki instance. The Wikimedia Foundation shares this data
# with MediaWiki developers to help guide future development efforts.
$wgPingback = false;

# Site language code, should be one of the list in ./includes/languages/data/Names.php
$wgLanguageCode = "en";

# Time zone
$wgLocaltimezone = "Europe/Berlin";

## Set $wgCacheDirectory to a writable directory on the web server
## to make your wiki go slightly faster. The directory should not
## be publicly accessible from the web.
#$wgCacheDirectory = "$IP/cache";

$wgSecretKey = "567fb8b2d9a0203ffa7d645210781d2e8acb2a165406f3e96371581db4a7585b";

# Changing this will log out all existing sessions.
$wgAuthenticationTokenVersion = "1";

# Site upgrade key. Must be set to a string (default provided) to turn on the
# web installer while LocalSettings.php is in place
$wgUpgradeKey = "9d5b2edf48eba19f";

## For attaching licensing metadata to pages, and displaying an
## appropriate copyright notice / icon. GNU Free Documentation
## License and Creative Commons licenses are supported so far.
$wgRightsPage = ""; # Set to the title of a wiki page that describes your license/copyright
$wgRightsUrl = "";
$wgRightsText = "";
$wgRightsIcon = "";

# Path to the GNU diff3 utility. Used for conflict resolution.
$wgDiff3 = "/usr/bin/diff3";

## Default skin: you can change the default skin. Use the internal symbolic
## names, e.g. 'vector' or 'monobook':
$wgDefaultSkin = "vector-2022";

# Enabled skins.
# The following skins were automatically enabled:
wfLoadSkin( 'Vector' );


# End of automatically generated settings.
# Add more configuration options below.

# 3D start

$wgTrustedMediaFormats[] = 'application/sla';
$wgTrustedMediaFormats[] = 'model/gltf-binary';
$wgTrustedMediaFormats[] = 'application/octet-stream';

$wgFileExtensions[] = '3d';
$wgFileExtensions[] = 'glb';
$wgFileExtensions[] = 'stl';

wfLoadExtension( '3D' );

$wgMediaViewerExtensions['stl'] = 'mmv.3d';
$wgMediaViewerExtensions['glb'] = 'mmv.3d';


wfLoadExtension( 'MultimediaViewer' );

$wg3dProcessor = [
    '/usr/bin/xvfb-run',
    '-a',
    '-s',
    '-ac -screen 0 1280x1024x24',
    '/home/zocki/mediawiki/mediawiki/3d2png/3d2png.js'

];

# 3D end

$wgShowExceptionDetails = true;

$wgMaxShellMemory = 8000000;

$wgMaxShellFileSize = 1000000;

$wgMaxShellTime = 300;

#$wgDebugToolbar = true;
#$wgShowExceptionDetails = true;
#$wgShowDebug = true;
#$wgDevelopmentWarnings = true;

#$wgMimeDetectorCommand = "file -bi"; # on Linux

#$wgDebugLogFile = '/home/zocki/mediawiki/mediawiki/log.txt';