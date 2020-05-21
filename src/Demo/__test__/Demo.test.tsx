import React from 'react';
import ReactDom from 'react-dom';
import { render, cleanup } from '@testing-library/react';
import renderer from 'react-test-renderer';

import '@testing-library/jest-dom/extend-expect';

import Demo, { DemoProps } from '../Demo';

afterEach(cleanup);

it('renders without crashing', () => {
	const div: HTMLDivElement = document.createElement('div');
	ReactDom.render(<Demo type='success' />, div);
	ReactDom.unmountComponentAtNode(div);
});

it('render Demo Component correctly', () => {
	const props: DemoProps = {
		type: 'success',
	};
	const { getByTestId } = render(<Demo {...props}>Hello World</Demo>);
	expect(getByTestId('DemoMessage')).toHaveTextContent('Hello World');
});

it('matches snapshot', () => {
	const tree = renderer.create(<Demo type={'danger'}>Errors</Demo>).toJSON();
	expect(tree).toMatchSnapshot();
});
