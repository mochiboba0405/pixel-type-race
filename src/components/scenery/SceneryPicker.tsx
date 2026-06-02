import { sceneryThemes } from '../../data/sceneryThemes';

type SceneryPickerProps = {
  selectedSceneryId: string;
  disabled?: boolean;
  onChange: (sceneryId: string) => void;
  onRandomize: () => void;
};

export function SceneryPicker({ selectedSceneryId, disabled = false, onChange, onRandomize }: SceneryPickerProps) {
  return (
    <div className="scenery-picker">
      <label className="field">
        <span>Scenery</span>
        <select value={selectedSceneryId} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          {sceneryThemes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>
      <button className="button button--secondary" type="button" disabled={disabled} onClick={onRandomize}>
        Randomize scenery
      </button>
    </div>
  );
}
