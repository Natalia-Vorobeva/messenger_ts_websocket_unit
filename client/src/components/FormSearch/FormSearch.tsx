import { useState, useEffect } from 'react';
import Form from '../Form/Form';
import './FormSearch.scss';

interface FormSearchProps {
	onSubmit: (value: string) => void;
	initialValue?: string;
	onClear?: () => void;
}

const FormSearch: React.FC<FormSearchProps> = ({
	onSubmit,
	initialValue = '',
	onClear,
}) => {
	const [value, setValue] = useState<string>(initialValue);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	const handleChangeTextSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);
		if (newValue === '') {
			onClear?.();
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (value.trim()) {
			onSubmit(value);
		} else {
			onClear?.();
		}
	};

	const handleClear = () => {
		setValue('');
		onClear?.();
	};

	return (
		<Form name="search" onSubmit={handleSubmit}>
			<div className="form-search__container">
				<div className="form-search__input-wrapper">
					<input
						id="search-input"
						type="search"
						className="form-search__input"
						placeholder="Поиск по сообщениям..."
						value={value}
						onChange={handleChangeTextSearch}
						aria-label="Поле поиска"
					/>
					{value && (
						<button
							type="button"
							onClick={handleClear}
							className="form-search__clear"
							aria-label="Очистить поле поиска"
							title="Очистить поиск"
						>
							×
						</button>
					)}
				</div>
				<button
					type="submit"
					className="form-search__submit"
					aria-label="Выполнить поиск"
					disabled={!value.trim()}
					title="Искать"
				>
					<span className="form-search__send">
						<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M5.74 15.75a39.14 39.14 0 0 0-1.3 3.91c-.55 2.37-.95 2.9 1.11 1.78 2.07-1.13 12.05-6.69 14.28-7.92 2.9-1.61 2.94-1.49-.16-3.2C17.31 9.02 7.44 3.6 5.55 2.54c-1.89-1.07-1.66-.6-1.1 1.77.17.76.61 2.08 1.3 3.94a4 4 0 0 0 3 2.54l5.76 1.11a.1.1 0 0 1 0 .2L8.73 13.2a4 4 0 0 0-3 2.54Z"
								fill="currentColor"
							/>
						</svg>
					</span>
				</button>
			</div>
		</Form>
	);
};

export default FormSearch;