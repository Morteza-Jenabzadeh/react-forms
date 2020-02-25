import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import FormRenderer from '../../components/form-renderer';
import SchemaErrorComponent from '../../form-renderer/schema-error-component';
import componentTypes from '../../components/component-types';
import formTemplate from '../../../../../__mocks__/mock-form-template';
import useFieldProviderApi from '../../hooks/use-field-provider-api';

const TextField = (props) => {
  const { input } = useFieldProviderApi(props);
  return (
    <div className="nested-item">
      <input {...input} id={input.name} />
    </div>
  );
};

describe('<FormRenderer />', () => {
  let formFieldsMapper;
  let initialProps;
  let schema;

  beforeEach(() => {
    formFieldsMapper = {
      [componentTypes.TEXT_FIELD]: TextField,
      [componentTypes.TEXTAREA_FIELD]: () => <div className="nested-item">Textarea field</div>,
      [componentTypes.SELECT_COMPONENT]: () => <div className="nested-item">Select field</div>,
      [componentTypes.CHECKBOX]: () => <div className="nested-item">checkbox field</div>,
      [componentTypes.SUB_FORM]: () => <div className="nested-item">sub form</div>,
      [componentTypes.RADIO]: () => <div className="nested-item">Radio field</div>,
      [componentTypes.TABS]: () => <div className="nested-item">Tabs field</div>,
      [componentTypes.DATE_PICKER]: () => <div className="nested-item">Date picker</div>,
      [componentTypes.TIME_PICKER]: () => <div className="nested-item">Time picker</div>,
      [componentTypes.TEXTAREA]: () => <div className="nested-item">Textarea field</div>,
      [componentTypes.SELECT]: () => <div className="nested-item">Select field</div>
    };

    schema = {
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'component1'
        },
        {
          component: componentTypes.SELECT,
          name: 'secret'
        }
      ]
    };

    initialProps = {
      formFieldsMapper,
      formTemplate,
      onSubmit: jest.fn(),
      schema
    };
  });

  it('should render form from schema', () => {
    const wrapper = mount(<FormRenderer {...initialProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render errorComponent form from schema', () => {
    const _console = console;

    const spy = jest.fn();
    const logSpy = jest.fn();
    // eslint-disable-next-line no-console
    console.error = spy;
    // eslint-disable-next-line no-console
    console.log = logSpy;

    const schemaWithError = {
      fields: [
        {
          name: 'field without component key'
        }
      ]
    };

    const wrapper = mount(<FormRenderer {...initialProps} schema={schemaWithError} />);

    expect(wrapper.find(SchemaErrorComponent));
    expect(spy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('error: ', expect.any(String));

    // eslint-disable-next-line no-global-assign
    console = _console;
  });

  it('should call form reset callback', () => {
    const onReset = jest.fn();
    const wrapper = mount(<FormRenderer {...initialProps} canReset onReset={onReset} />);
    wrapper.find('input#component1').simulate('change', { target: { value: 'foo' }});
    wrapper.update();
    wrapper
    .find('button')
    .at(1)
    .simulate('click');
    expect(onReset).toHaveBeenCalled();
  });

  it('should render hidden field', () => {
    const onSubmit = jest.fn();

    const wrapper = mount(
      <FormRenderer
        {...initialProps}
        schema={{
          fields: [
            {
              component: componentTypes.TEXT_FIELD,
              name: 'visible',
              label: 'Visible'
            },
            {
              component: componentTypes.TEXT_FIELD,
              name: 'hidden',
              label: 'Hidden',
              hideField: true
            }
          ]
        }}
        onSubmit={onSubmit}
      />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
