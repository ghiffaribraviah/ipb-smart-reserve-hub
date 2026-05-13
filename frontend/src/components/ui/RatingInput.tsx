type RatingInputProps = {
  value: number;
};

export function RatingInput({ value }: RatingInputProps) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">Rating</legend>
      <div className="flex gap-2" role="radiogroup" aria-label={`Rating ${value} dari 5`}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label
            className="relative inline-flex h-9 w-7 cursor-pointer items-center justify-center text-[30px] leading-none"
            key={rating}
          >
            <input
              checked={rating === value}
              className="sr-only"
              name="ui-primitives-rating"
              readOnly
              type="radio"
              value={rating}
              aria-label={`${rating} dari 5`}
            />
            <span
              aria-hidden="true"
              className={rating <= value ? "text-[#f59e0b]" : "text-[#d1d5db]"}
            >
              ★
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
