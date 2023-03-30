
export async function getPlugins() {
    const pluginsJsonUrl = 'https://raw.githubusercontent.com/netlify/plugins/main/site/plugins.json';

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

    return allOutdatePlugins;
  }

async function getOutdatedPlugin(plugin) {
    const npmRegistryUrl = 'https://registry.npmjs.com/';  

    console.log('Checking ' + plugin.package);

    // fetch package information from NPM registry
    const response = await fetch(npmRegistryUrl + plugin.package, {
        headers: {
            'Accept': 'application/vnd.npm.install-v1+json' // to accept only abbreviated document response
        }
    });

    const npmPackage = await response.json();
    const latestVersion = npmPackage['dist-tags'].latest; // this is the latest publiushed version on NPM
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
            packageUrl: 'https://www.npmjs.com/package/' + plugin.package,
            pluginVersion: plugin.version,
            npmVersion: latestVersion,
            changeStage: changeStage,
            modified: plugin.modified
        }

        // console.log(plugin.name + ', ' + plugin.version + ', ' + latestVersion + ', ' + changeStage)
    }

    return outdatedPlugin;
  }