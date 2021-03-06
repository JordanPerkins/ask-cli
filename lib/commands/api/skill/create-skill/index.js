const fs = require('fs');

const { AbstractCommand } = require('@src/commands/abstract-command');
const Messenger = require('@src/view/messenger');
const jsonView = require('@src/view/json-view');
const SmapiClient = require('@src/clients/smapi-client');
const optionModel = require('@src/commands/option-model');
const profileHelper = require('@src/utils/profile-helper');

class CreateSkillCommand extends AbstractCommand {
    name() {
        return 'create-skill';
    }

    description() {
        return 'create a new skill';
    }

    requiredOptions() {
        return ['file'];
    }

    optionalOptions() {
        return ['profile', 'debug'];
    }

    handle(cmd, cb) {
        let profile, vendorId, manifestContent;
        try {
            profile = profileHelper.runtimeProfile(cmd.profile);
            vendorId = profileHelper.resolveVendorId(profile);
            manifestContent = JSON.parse(fs.readFileSync(cmd.file, 'utf-8'));
        } catch (err) {
            Messenger.getInstance().error(err);
            return cb(err);
        }

        const smapiClient = new SmapiClient({
            profile,
            doDebug: cmd.debug
        });
        smapiClient.skill.createSkill(manifestContent, vendorId, (err, response) => {
            if (err) {
                Messenger.getInstance().error(err);
                return cb(err);
            }
            if (response.statusCode >= 300) {
                const error = jsonView.toString(response.body);
                Messenger.getInstance().error(error);
                cb(error);
            } else {
                Messenger.getInstance().info(jsonView.toString(response.body));
                cb();
            }
        });
    }
}

module.exports = {
    createCommand: new CreateSkillCommand(optionModel).createCommand()
};
