const { AbstractCommand } = require('@src/commands/abstract-command');
const Messenger = require('@src/view/messenger');
const jsonView = require('@src/view/json-view');
const SmapiClient = require('@src/clients/smapi-client');
const optionModel = require('@src/commands/option-model');
const profileHelper = require('@src/utils/profile-helper');

class GetCatalogUploadCommand extends AbstractCommand {
    name() {
        return 'get-catalog-upload';
    }

    description() {
        return 'get the catalog by catalog-id';
    }

    requiredOptions() {
        return ['catalog-id', 'catalog-upload-id'];
    }

    optionalOptions() {
        return ['profile', 'debug'];
    }

    handle(cmd, cb) {
        let profile;
        try {
            profile = profileHelper.runtimeProfile(cmd.profile);
        } catch (err) {
            Messenger.getInstance().error(err);
            return cb(err);
        }
        const smapiClient = new SmapiClient({
            profile,
            doDebug: cmd.debug
        });
        smapiClient.catalog.getCatalogUpload(cmd.catalogId, cmd.uploadId, (err, response) => {
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
    createCommand: new GetCatalogUploadCommand(optionModel).createCommand()
};
