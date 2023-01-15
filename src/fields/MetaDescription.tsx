import React, { useCallback, useState } from 'react';
import { useField, useAllFormFields } from 'payload/components/forms';
import { useLocale } from 'payload/components/utilities';
import { FieldType, Options } from 'payload/dist/admin/components/forms/useField/types';
import { LengthIndicator } from '../ui/LengthIndicator';
import { defaults } from '../defaults';
import TextareaInput from 'payload/dist/admin/components/forms/field-types/Textarea/Input';
import { TextareaField } from 'payload/dist/fields/config/types';
import { PluginConfig } from '../types';
import { generateAIMetaDescriptionClient } from '../ai/Generator';

const {
  minLength,
  maxLength,
} = defaults.description;

type TextareaFieldWithProps = TextareaField & {
  path: string
  pluginConfig: PluginConfig
  slug?: string
};

export const MetaDescription: React.FC<(TextareaFieldWithProps | {}) & {
  pluginConfig: PluginConfig
}> = (props) => {
  const {
    path,
    label,
    name,
    pluginConfig,
    slug
  } = props as TextareaFieldWithProps || {}; // TODO: this typing is temporary until payload types are updated for custom field props

  const locale = useLocale();
  const [fields] = useAllFormFields();

  const field: FieldType<string> = useField({
    label,
    name,
    path
  } as Options);

  const {
    value,
    setValue,
    showError
  } = field;

  const [readOnly, setReadOnly] = useState(false);

  const regenerateDescription = useCallback(() => {
    const { generateDescription } = pluginConfig;

    const getDescription = async () => {
      setReadOnly(true);
      let generatedDescription;
      if (typeof generateDescription === 'function') {
        generatedDescription = await generateDescription({ doc: { ...fields }, locale, slug });
      }
      setValue(generatedDescription);
      setReadOnly(false);
    }
    getDescription();
  }, [
    fields,
    setValue,
    pluginConfig,
    locale
  ]);

  const regenerateDescriptionWithAI = useCallback(() => {
    const { ai } = pluginConfig;

    const getDescription = async () => {
      setReadOnly(true);
      setValue("Generating...")

      let pageContent: string|undefined;
      if (typeof ai?.getPageContent === 'function') {
        pageContent = await ai?.getPageContent({ doc: { ...fields }, locale, slug });
      }
      if(pageContent) {
        setValue(await generateAIMetaDescriptionClient({ doc: { ...fields },pageContent, locale, slug }));
      }else{
        setValue("Error: No page content found.")
      }
      setReadOnly(false);
    }

    getDescription();
  }, [
    fields,
    setValue,
    pluginConfig,
    locale
  ]);

  return (
    <div
      style={{
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          marginBottom: '5px',
          position: 'relative',
        }}
      >
        <div>
          {label}
          &nbsp;
          &mdash;
          &nbsp;
          <button
            onClick={regenerateDescription}
            type="button"
            style={{
              padding: 0,
              background: 'none',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textDecoration: 'underline',
              color: 'currentcolor',
            }}
          >
            Auto-generate
          </button>
          {pluginConfig.ai && (
            <>
              &nbsp;
              &mdash;
              &nbsp;
              <button
                onClick={regenerateDescriptionWithAI}
                type="button"
                style={{
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: 'currentcolor',
                }}
              >
                AI-generate
              </button>
            </>
          )}
        </div>
        <div
          style={{
            color: '#9A9A9A',
          }}
        >
          {`This should be between ${minLength} and ${maxLength} characters. Auto-generation will format a description using the page content. For help in writing quality meta descriptions, see `}
          <a
            href="https://developers.google.com/search/docs/advanced/appearance/snippet#meta-descriptions"
            rel="noopener noreferrer"
            target="_blank"
          >
            best practices
          </a>
        </div>
      </div>
      <div
        style={{
          marginBottom: '10px',
          position: 'relative',
        }}
      >
        <TextareaInput
          path={name}
          name={name}
          onChange={setValue}
          value={value}
          showError={showError}
          readOnly={readOnly}
          style={{
            marginBottom: 0
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <LengthIndicator
          text={value as string}
          minLength={minLength}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};

export const getMetaDescriptionField = (props: any) => (
  <MetaDescription {...props} />
)
