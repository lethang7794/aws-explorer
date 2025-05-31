// Function to convert PascalCase to Title Case
export function pascalToTitleCase(input: string): string {
  // Step 1: Insert space before each capital letter (except the first one)
  const spaced = input.replace(/([A-Z])/g, ' $1').trim()

  // Step 2: Convert to Title Case (capitalize first letter, rest lowercase)
  const titleCase = spaced
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return titleCase
}
