const pluginsJsonUrl = 'https://raw.githubusercontent.com/netlify/plugins/main/site/plugins.json';
const npmRegistryUrl = 'http://registry.npmjs.com/';

async function getPlugins() {
    const response = await fetch(pluginsJsonUrl);
    const plugins = await response.json()
    const allOutdatePlugins = [];

    for (let i = 0; i < plugins.length; i++) {
        const outdatedPlugin = await getOutdatedPlugin(plugins[i]);

        if(outdatedPlugin){
            console.log(outdatedPlugin)
            allOutdatePlugins.push(outdatedPlugin);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(allOutdatePlugins)
    }
}

async function getOutdatedPlugin(plugin) {
    // fetch package information from NPM registry
    const response = await fetch(npmRegistryUrl + plugin.package, {
        headers: {
            'Accept': 'application/vnd.npm.install-v1+json' // to accept only abbreviated document response
        }
    });

    const package = await response.json();
    const latestVersion = package['dist-tags'].latest; // this is the latest publiushed version on NPM
    let outdatedPlugin = null;

    // check if plugin version is not the same as NPM version
    if(plugin.version !== latestVersion){
        // split the semantic version to determine change stage: https://docs.npmjs.com/about-semantic-versioning
        const pluginVersion = plugin.version.split('.')
        const npmVersion = latestVersion.split('.')
        let changeStage = 'unknown';

        // Major release: Changes that break backward compatibility
        if(pluginVersion[0] < npmVersion[0]) {
            changeStage = 'major'
        }
        // Minor release: Backward compatible new features
        else if (pluginVersion[1] < npmVersion[1]) {
            changeStage = 'minor'
        }
        // Patch release: Backward compatible bug fixes
        else if (pluginVersion[2] < npmVersion[2]) {
            changeStage = 'patch'
        }

        outdatedPlugin = {
            name: plugin.name,
            pluginVersion: plugin.version,
            npmVersion: latestVersion,
            changeStage: changeStage
        }

        // console.log(plugin.name + ', ' + plugin.version + ', ' + latestVersion + ', ' + changeStage)
    }

    return outdatedPlugin;
}

exports.handler = async () => {
    return getPlugins();
};