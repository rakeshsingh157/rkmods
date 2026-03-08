def main():
    """
    Prompts the user for their name and prints a personalized greeting.
    """
    # Get the user's name from standard input.
    # The input() function displays a prompt and waits for user input,
    # returning the entered string.
    name = input('Enter name: ')

    # Print a greeting using an f-string for clear and concise string formatting.
    # f-strings (formatted string literals) provide a readable way to embed
    # expressions inside string literals.
    print(f'Hello, {name}!')


if __name__ == "__main__":
    # This block ensures that the 'main()' function is called only when
    # the script is executed directly (e.g., python your_script.py),
    # not when it's imported as a module into another script.
    main()
