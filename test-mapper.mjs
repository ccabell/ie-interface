// Test script to verify the mapper works with real API response
import { execSync } from 'child_process';

// Fetch real API response
const response = execSync(
  'curl -s -X POST "https://prompt-runner-production.up.railway.app/run_extraction" -H "Content-Type: application/json" -d "{\\"transcript_id\\":\\"67de7833-0754-4b8f-979e-26d2629c691f\\"}"',
  { encoding: 'utf8', timeout: 180000 }
);

const data = JSON.parse(response);

console.log('=== API RESPONSE ANALYSIS ===\n');
console.log('Top-level keys:', Object.keys(data));
console.log('Status:', data.status);

if (data.outputs) {
  console.log('\n=== OUTPUTS ===');
  console.log('outputs keys:', Object.keys(data.outputs));

  if (data.outputs.prompt_1?.parsed_json) {
    const p1 = data.outputs.prompt_1.parsed_json;
    console.log('\n--- prompt_1.parsed_json ---');
    console.log('extraction_version:', p1.extraction_version);
    console.log('pass:', p1.pass);
    console.log('keys:', Object.keys(p1));
    if (p1.patient_goals) {
      console.log('patient_goals.goals.value:', p1.patient_goals?.goals?.value);
    }
    if (p1.offerings) {
      console.log('offerings count:', p1.offerings.length);
      console.log('first offering:', p1.offerings[0]?.name);
    }
  }

  if (data.outputs.prompt_2?.parsed_json) {
    const p2 = data.outputs.prompt_2.parsed_json;
    console.log('\n--- prompt_2.parsed_json ---');
    console.log('extraction_version:', p2.extraction_version);
    console.log('pass:', p2.pass);
    console.log('keys:', Object.keys(p2));
    if (p2.outcome?.summary?.value) {
      console.log('summary:', p2.outcome.summary.value.substring(0, 100) + '...');
    }
    if (p2.concerns) {
      console.log('concerns count:', p2.concerns.length);
    }
    if (p2.next_steps) {
      console.log('next_steps count:', p2.next_steps.length);
    }
  }
}

// Now test what mapRunResponseToCards would see
console.log('\n=== MAPPER TEST ===');

// Simulate isV3Extraction check
function isV3Extraction(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'extraction_version' in obj &&
    obj.extraction_version === '3.0'
  );
}

const p1 = data.outputs?.prompt_1?.parsed_json;
const p2 = data.outputs?.prompt_2?.parsed_json;

console.log('Has outputs.prompt_1.parsed_json:', !!p1);
console.log('Has outputs.prompt_2.parsed_json:', !!p2);
console.log('p1 isV3Extraction:', p1 ? isV3Extraction(p1) : 'N/A');
console.log('p2 isV3Extraction:', p2 ? isV3Extraction(p2) : 'N/A');

// Check the condition in mapRunResponseToCards
const hasV3Data = (p1 && isV3Extraction(p1)) || (p2 && isV3Extraction(p2));
console.log('Should use V3 mapper:', hasV3Data);
