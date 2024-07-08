"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var normJoinPath_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/normJoinPath"));
var details = function () { return ({
    name: 'Organize Files',
    description: 'Move working file to organized directory structure.',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faRandom',
    inputs: [
        {
            label: 'Movie Base Directory',
            name: 'movieBaseDirectory',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'directory',
            },
            tooltip: 'Specify base output directory for movies',
        },
        {
            label: 'TV Show Base Directory',
            name: 'tvBaseDirectory',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'directory',
            },
            tooltip: 'Specify base output directory for tv shows',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// e.g. Tangled (2010)
// e.g. Tangled (2010) - part1
// e.g. Tangled (2010) {edition-Theatrical}
// eslint-disable-next-line max-len
var movieFileRegex = /^(?<movie>.* \(\d{4}\))\s?-?\s?(?:(?<edition>{edition-.*})|(?<part>(?:cd|disc|disk|dvd|part|pt)\d+))?$/ig;
// e.g. Tangled (2010)-Bloopers-featurette
var movieExtrasFileRegex = /^(?<movie>.* \(\d{4}\))-(?<extra>.*-\w+)$/ig;
// e.g. DuckTales - S01E01
// e.g. DuckTales - S01E01 - Don't Give Up the Ship (1)
// e.g. DuckTales - S01E01-E03 - Don't Give Up the Ship (1) & Wronguay in Ronguay (2) & ...
// eslint-disable-next-line max-len
var tvShowFileRegex = /^(?<show>.*) - S(?<season>\d{1,2})E(?<episode>\d{1,2})(?:-E(?<episode2>\d{1,2}))?(?:\s*-\s*(?<episodeName>.*))?$/ig;
var format2Digits = function (num) { return parseInt(num, 10)
    .toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }); };
var getTargetFolder = function (filename, container, movieDir, tvDir) {
    var _a, _b, _c;
    // File is main movie file - put in folder of same name for Radarr
    if (filename.match(movieFileRegex)) {
        var _d = (_a = movieFileRegex.exec(filename)) !== null && _a !== void 0 ? _a : [], movie = _d[1], edition = _d[2], part = _d[3];
        if (edition || part) {
            return [movieDir, movie, edition ? "".concat(movie, " ").concat(edition, ".").concat(container) : "".concat(movie, " - ").concat(part, ".").concat(container)];
        }
        return [movieDir, movie, "".concat(movie, ".").concat(container)];
    }
    // File is movie extra - put in folder of main movie file
    if (filename.match(movieExtrasFileRegex)) {
        var match = movieExtrasFileRegex.exec(filename);
        return [movieDir, (_b = match === null || match === void 0 ? void 0 : match[1]) !== null && _b !== void 0 ? _b : '', "".concat(match === null || match === void 0 ? void 0 : match[2], ".").concat(container)];
    }
    // File is tv show - put in season folder under show folder
    if (filename.match(tvShowFileRegex)) {
        var _e = (_c = tvShowFileRegex.exec(filename)) !== null && _c !== void 0 ? _c : [], show = _e[1], season = _e[2], episode = _e[3], episode2 = _e[4], episodeName = _e[5];
        var cleanFilename = "".concat(show, " - S").concat(format2Digits(season))
            + "E".concat(format2Digits(episode)).concat(episode2 ? "-E".concat(format2Digits(episode2)) : '')
            + " - ".concat(episodeName);
        if (season === '00') {
            return [tvDir, show, 'Specials', "".concat(cleanFilename, ".").concat(container)];
        }
        return [tvDir, show, "Season ".concat(format2Digits(season)), "".concat(cleanFilename, ".").concat(container)];
    }
    return ["".concat(filename, ".").concat(container)];
};
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, movieBaseDirectory, tvBaseDirectory, originalFileName, newContainer, paths, ouputFilePath;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                movieBaseDirectory = String(args.inputs.movieBaseDirectory).replace(/\/$/, '');
                tvBaseDirectory = String(args.inputs.tvBaseDirectory).replace(/\/$/, '');
                originalFileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
                newContainer = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
                paths = (_a = getTargetFolder(originalFileName, newContainer, movieBaseDirectory, tvBaseDirectory)) !== null && _a !== void 0 ? _a : '';
                ouputFilePath = (0, normJoinPath_1.default)({
                    upath: args.deps.upath,
                    paths: paths,
                });
                args.jobLog("Input path: ".concat(args.inputFileObj._id));
                args.jobLog("Output path: ".concat(ouputFilePath));
                if (args.inputFileObj._id === ouputFilePath) {
                    args.jobLog('Input and output path are the same, skipping move.');
                    return [2 /*return*/, {
                            outputFileObj: {
                                _id: args.inputFileObj._id,
                            },
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                args.deps.fsextra.ensureDirSync((0, fileUtils_1.getFileAbosluteDir)(ouputFilePath));
                return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                        operation: 'move',
                        sourcePath: args.inputFileObj._id,
                        destinationPath: ouputFilePath,
                        args: args,
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: ouputFilePath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
