import fileMoveOrCopy from '../../../../FlowHelpers/1.0.0/fileMoveOrCopy';
import { getContainer, getFileName, getFileAbosluteDir } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import normJoinPath from '../../../../FlowHelpers/1.0.0/normJoinPath';

const details = (): IpluginDetails => ({
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
});

// e.g. Tangled (2010)
// e.g. Tangled (2010) - part1
// e.g. Tangled (2010) {edition-Theatrical}
// eslint-disable-next-line max-len
const movieFileRegex = /^(?<movie>.* \(\d{4}\))\s?-?\s?(?:(?<edition>{edition-.*})|(?<part>(?:cd|disc|disk|dvd|part|pt)\d+))?$/ig;
// e.g. Tangled (2010)-Bloopers-featurette
const movieExtrasFileRegex = /^(?<movie>.* \(\d{4}\))-(?<extra>.*-\w+)$/ig;

// e.g. DuckTales - S01E01
// e.g. DuckTales - S01E01 - Don't Give Up the Ship (1)
// e.g. DuckTales - S01E01-E03 - Don't Give Up the Ship (1) & Wronguay in Ronguay (2) & ...
// eslint-disable-next-line max-len
const tvShowFileRegex = /^(?<show>.*) - S(?<season>\d{1,2})E(?<episode>\d{1,2})(?:-E(?<episode2>\d{1,2}))?(?:\s*-\s*(?<episodeName>.*))?$/ig;

const format2Digits = (num: string): string => parseInt(num, 10)
  .toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

const getTargetFolder = (filename: string, container: string, movieDir: string, tvDir: string): string[] => {
  // File is main movie file - put in folder of same name for Radarr
  if (filename.match(movieFileRegex)) {
    const [, movie, edition, part] = movieFileRegex.exec(filename) ?? [];

    if (edition || part) {
      return [movieDir, movie, edition ? `${movie} ${edition}.${container}` : `${movie} - ${part}.${container}`];
    }

    return [movieDir, movie, `${movie}.${container}`];
  }
  // File is movie extra - put in folder of main movie file
  if (filename.match(movieExtrasFileRegex)) {
    const match = movieExtrasFileRegex.exec(filename);

    return [movieDir, match?.[1] ?? '', `${match?.[2]}.${container}`];
  }
  // File is tv show - put in season folder under show folder
  if (filename.match(tvShowFileRegex)) {
    const [, show, season, episode, episode2, episodeName] = tvShowFileRegex.exec(filename) ?? [];
    const cleanFilename = `${show} - S${format2Digits(season)}`
      + `E${format2Digits(episode)}${episode2 ? `-E${format2Digits(episode2)}` : ''}`
      + ` - ${episodeName}`;

    if (season === '00') {
      return [tvDir, show, 'Specials', `${cleanFilename}.${container}`];
    }

    return [tvDir, show, `Season ${format2Digits(season)}`, `${cleanFilename}.${container}`];
  }

  return [`${filename}.${container}`];
};

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();

  // eslint-disable-next-line no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const movieBaseDirectory = String(args.inputs.movieBaseDirectory).replace(/\/$/, '');
  const tvBaseDirectory = String(args.inputs.tvBaseDirectory).replace(/\/$/, '');

  const originalFileName = getFileName(args.inputFileObj._id);
  const newContainer = getContainer(args.inputFileObj._id);

  const paths = getTargetFolder(originalFileName, newContainer, movieBaseDirectory, tvBaseDirectory) ?? '';

  const ouputFilePath = normJoinPath({
    upath: args.deps.upath,
    paths,
  });

  args.jobLog(`Input path: ${args.inputFileObj._id}`);
  args.jobLog(`Output path: ${ouputFilePath}`);

  if (args.inputFileObj._id === ouputFilePath) {
    args.jobLog('Input and output path are the same, skipping move.');

    return {
      outputFileObj: {
        _id: args.inputFileObj._id,
      },
      outputNumber: 1,
      variables: args.variables,
    };
  }

  args.deps.fsextra.ensureDirSync(getFileAbosluteDir(ouputFilePath));

  await fileMoveOrCopy({
    operation: 'move',
    sourcePath: args.inputFileObj._id,
    destinationPath: ouputFilePath,
    args,
  });

  return {
    outputFileObj: {
      _id: ouputFilePath,
    },
    outputNumber: 1,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};
