'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { LoaderCircle, MapPin } from 'lucide-react';
import { API_PATHS, API_URLS } from '@plate40/config';

export interface AddressSelection {
  placeId: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

interface AddressSuggestion {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
}

interface ApiResponse<T> {
  data: T;
}

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  onAddressSelect: (address: AddressSelection) => void;
  onError?: (message: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  disabled?: boolean;
  name?: string;
  id?: string;
}

function sessionToken() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function AddressAutocomplete({
  value,
  onValueChange,
  onAddressSelect,
  onError,
  placeholder = 'House number, street, area or landmark',
  required,
  autoFocus,
  maxLength = 255,
  disabled,
  name,
  id,
}: Props) {
  const generatedId = useId();
  const listId = `${id ?? generatedId}-google-address-list`;
  const tokenRef = useRef('');
  const selectedValueRef = useRef('');
  const onErrorRef = useRef(onError);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const input = value.trim();
    if (input.length < 3 || selectedValueRef.current || disabled) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      tokenRef.current ||= sessionToken();
      try {
        const query = new URLSearchParams({ input, sessionToken: tokenRef.current });
        const response = await fetch(
          `${API_URLS.main}${API_PATHS.locations.autocomplete}?${query}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('Address suggestions are unavailable');
        const payload = (await response.json()) as ApiResponse<AddressSuggestion[]>;
        setSuggestions(payload.data ?? []);
        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSuggestions([]);
          onErrorRef.current?.('Google address suggestions are temporarily unavailable.');
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [disabled, value]);

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    setResolving(true);
    setSuggestions([]);
    try {
      const query = new URLSearchParams({ sessionToken: tokenRef.current || sessionToken() });
      const response = await fetch(
        `${API_URLS.main}${API_PATHS.locations.details(suggestion.placeId)}?${query}`,
      );
      if (!response.ok) throw new Error('Address details are unavailable');
      const payload = (await response.json()) as ApiResponse<AddressSelection>;
      selectedValueRef.current = payload.data.addressLine1 || payload.data.formattedAddress;
      onValueChange(selectedValueRef.current);
      onAddressSelect(payload.data);
      tokenRef.current = '';
      setActiveIndex(-1);
    } catch {
      onErrorRef.current?.('Could not load this address. Please choose another suggestion.');
    } finally {
      setResolving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current >= suggestions.length - 1 ? 0 : current + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) void selectSuggestion(suggestion);
    } else if (event.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="p40-address-autocomplete">
      <MapPin className="p40-address-autocomplete__pin" size={18} aria-hidden />
      <input
        className="p40-input"
        id={id}
        name={name}
        value={value}
        required={required}
        autoFocus={autoFocus}
        maxLength={maxLength}
        disabled={disabled || resolving}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        aria-busy={searching || resolving}
        onChange={(event) => {
          selectedValueRef.current = '';
          onValueChange(event.target.value);
          setSuggestions([]);
          setActiveIndex(-1);
          setSearching(false);
        }}
        onKeyDown={handleKeyDown}
      />
      {searching || resolving ? (
        <LoaderCircle className="p40-address-autocomplete__loader" size={17} aria-hidden />
      ) : null}
      {suggestions.length ? (
        <div className="p40-address-autocomplete__menu" id={listId} role="listbox">
          {suggestions.map((suggestion, index) => (
            <button
              id={`${listId}-${index}`}
              key={suggestion.placeId}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? 'is-active' : ''}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void selectSuggestion(suggestion)}
            >
              <MapPin size={17} aria-hidden />
              <span>
                <strong>{suggestion.mainText}</strong>
                <small>{suggestion.secondaryText}</small>
              </span>
            </button>
          ))}
          <div className="p40-address-autocomplete__google">
            {/* Google requires its supplied branding asset to be shown with autocomplete results. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
              alt="Powered by Google"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
