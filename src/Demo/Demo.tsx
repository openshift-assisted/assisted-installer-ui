import React, { SFC } from 'react';
import './Demo.css';

export type Type = 'info' | 'success' | 'danger' | 'warning';
export type TypesMap = Record<Type, string>;

const types: TypesMap = {
	info: '#5352ED',
	success: '#2ED573',
	danger: '#FF4757',
	warning: '#FFA502',
};

export interface DemoProps {
	/**
	 * Set this to change Demo Type
	 * @default info
	 */
	type: 'info' | 'success' | 'danger' | 'warning';
	children?: any;
}


const Demo: SFC<DemoProps> = ({ children, type = 'info', ...rest }) => (
	<div
		data-testid='DemoMessage'
		className={'my-demo-class'}
		style={{
			background: `${types[type] || 'black'}`,
		}}
		{...rest}
	>
		{children}
	</div>
);

export default Demo;
