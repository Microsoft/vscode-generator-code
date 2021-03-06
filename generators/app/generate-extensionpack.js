/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

const prompts = require("./prompts");
let childProcess = require('child_process');

module.exports = {
    id: 'ext-extensionpack',
    aliases: ['extensionpack'],
    name: 'New Extension Pack',
    /**
     * @param {import('yeoman-generator')} generator
     * @param {Object} extensionConfig
     */
    prompting: async (generator, extensionConfig) => {

        await askForExtensionPackInfo(generator, extensionConfig);

        await prompts.askForExtensionDisplayName(generator, extensionConfig);
        await prompts.askForExtensionId(generator, extensionConfig);
        await prompts.askForExtensionDescription(generator, extensionConfig);

        await prompts.askForGit(generator, extensionConfig);
    },
    /**
     * @param {import('yeoman-generator')} generator
     * @param {Object} extensionConfig
     */
    writing: (generator, extensionConfig) => {
        generator.fs.copy(generator.sourceRoot() + '/vscode', '.vscode');
        generator.fs.copyTpl(generator.sourceRoot() + '/package.json', 'package.json', extensionConfig);
        generator.fs.copyTpl(generator.sourceRoot() + '/vsc-extension-quickstart.md', 'vsc-extension-quickstart.md', extensionConfig);
        generator.fs.copyTpl(generator.sourceRoot() + '/README.md', 'README.md', extensionConfig);
        generator.fs.copyTpl(generator.sourceRoot() + '/CHANGELOG.md', 'CHANGELOG.md', extensionConfig);
        generator.fs.copy(generator.sourceRoot() + '/vscodeignore', '.vscodeignore');
        if (extensionConfig.gitInit) {
            generator.fs.copy(generator.sourceRoot() + '/gitignore', '.gitignore');
            generator.fs.copy(generator.sourceRoot() + '/gitattributes', '.gitattributes');
        }
    }
}

function askForExtensionPackInfo(generator, extensionConfig) {
    extensionConfig.isCustomization = true;
    const defaultExtensionList = ['publisher.extensionName'];

    const getExtensionList = () =>
        new Promise((resolve, reject) => {
            childProcess.exec(
                'code --list-extensions',
                (error, stdout, stderr) => {
                    if (error) {
                        generator.env.error(error);
                    } else {
                        let out = stdout.trim();
                        if (out.length > 0) {
                            extensionConfig.extensionList = out.split(/\s/);
                        }
                    }
                    resolve();
                }
            );
        });

    return generator.prompt({
        type: 'confirm',
        name: 'addExtensions',
        message: 'Add the currently installed extensions to the extension pack?',
        default: true
    }).then(addExtensionsAnswer => {
        extensionConfig.extensionList = defaultExtensionList;
        if (addExtensionsAnswer.addExtensions) {
            return getExtensionList();
        }
    });
}