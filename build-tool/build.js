/* eslint-disable indent */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

// #!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const which = require('which');
const yargsParser = require('yargs-parser');
const spawn = require('cross-spawn');
const rimraf = require('rimraf');
const { fromRoot, extensions } = require('./utils');

const here = (p) => path.join(__dirname, p);
const hereRelative = (p) => here(p).replace(process.cwd(), '.');
const parsedArgs = yargsParser(process.argv.slice(2));
const isWindow = process.platform === 'win32';

const resolveBin = (
	modName,
	{ executable = modName, cwd = process.cwd() } = {}
) => {
	let pathFromWhich;
	if (isWindow) {
		return path.join(cwd, 'node_modules', '.bin', executable);
	}

	try {
		pathFromWhich = fs.realpathSync(which.sync(executable));
	} catch (_error) {
		// ignore _error
	}
	try {
		const modPkgPath = require.resolve(`${modName}/package.json`);
		const modPkgDir = path.dirname(modPkgPath);
		const { bin } = require(modPkgPath);
		const binPath = typeof bin === 'string' ? bin : bin[executable];
		const fullPathToBin = path.join(modPkgDir, binPath);
		if (fullPathToBin === pathFromWhich) {
			return executable;
		}
		return fullPathToBin.replace(cwd, '.');
	} catch (error) {
		if (pathFromWhich) {
			return executable;
		}
		throw error;
	}
};

function getConcurrentlyArgs(scripts, { killOthers = true } = {}) {
	const colors = [
		'bgBlue',
		'bgGreen',
		'bgMagenta',
		'bgCyan',
		'bgWhite',
		'bgRed',
		'bgBlack',
		'bgYellow',
	];
	scripts = Object.entries(scripts).reduce((all, [name, script]) => {
		if (script) {
			all[name] = script;
		}
		return all;
	}, {});
	const prefixColors = Object.keys(scripts)
		.reduce(
			(pColors, _s, i) =>
				pColors.concat([`${colors[i % colors.length]}.bold.reset`]),
			[]
		)
		.join(',');

	// prettier-ignore
	return [
		killOthers ? '--kill-others-on-fail' : null,
    '--prefix', '[{name}]',
		'--names', Object.keys(scripts).join(','),
    '--prefix-colors', prefixColors,
    ...Object.values(scripts).map((s) => JSON.stringify(s)), // stringify escapes quotes ✨
	].filter(Boolean);
}

const rollupFormats = ['umd', 'umd.min'];
const config = `--config ${hereRelative('./rollup.config.js')}`;
const sizeSnapshot = parsedArgs['size-snapshot'];
const buildInput = parsedArgs['build-input'];

const rollupCommand = [resolveBin('rollup'), config];

function getRollupCommands() {
	return rollupFormats.reduce((cmds, format) => {
		const [formatName, minify = false] = format.split('.');
		const nodeEnv = minify ? 'production' : 'development';
		const sourceMap = formatName === 'umd' ? '--sourcemap' : '';
		const buildMinify = Boolean(minify);
		const env = [
			`${isWindow ? 'set ' : ''}BUILD_FORMAT=${formatName}`,
			`${isWindow ? 'set ' : ''}NODE_ENV=${nodeEnv}`,
			buildMinify
				? `${isWindow ? 'set ' : ''}BUILD_MINIFY=${buildMinify}`
				: null,
			sizeSnapshot
				? `${isWindow ? 'set ' : ''}BUILD_SIZE_SNAPSHOT=${sizeSnapshot}`
				: null,
			buildInput
				? `${isWindow ? 'set ' : ''}BUILD_INPUT='${buildInput}'`
				: null,
		]
			.filter(Boolean)
			.join(isWindow?'&& ': ' ');
		cmds[format] = [`${env}${isWindow?' && ':''}`, ...rollupCommand, sourceMap]
			.filter(Boolean)
			.join(' ');
		return cmds;
	}, {});
}

const babelFormats = [
	{
		name: 'esnext',
		babelrc: here('./babelrc.esm.pure.js'),
	},
	{
		name: 'es',
		babelrc: here('./babelrc.esm.js'),
	},
	{
		name: 'cjs',
		babelrc: here('./babelrc.cjs.js'),
	},
];

function getBabelCommands() {
	return babelFormats.reduce((cmds, { name, babelrc }) => {
		cmds[name] = [
			resolveBin('@babel/cli', {
				executable: 'babel',
			}),
			`--presets ${babelrc}`,
			`--out-dir dist/${name}`,
			'--ignore src/**/*.test.ts',
			'--ignore src/**/*.test.tsx',
			'--ignore src/**/*.test.js',
			'--ignore src/**/*.test.jsx',
			`--extensions ${extensions.join(',')}`,
			'src',
		].join(' ');
		return cmds;
	}, {});
}

function generateTypesCommand() {
	return {
		generateTypes: [
			resolveBin('typescript', {
				executable: 'tsc',
			}),
			`--outDir dist/types`,
			'--emitDeclarationOnly',
		].join(' '),
	};
}

rimraf.sync(fromRoot('dist'));

const scripts = getConcurrentlyArgs({
	...generateTypesCommand(),
	...getRollupCommands(),
	...getBabelCommands(),
});

const result = spawn.sync(resolveBin('concurrently'), scripts, {
	stdio: 'inherit',
	cwd: process.cwd(),
});

process.exit(result.status);
