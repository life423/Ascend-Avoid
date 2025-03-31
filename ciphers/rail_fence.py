"""Rail Fence Cipher implementation."""


class RailFenceCipher:
    """
    Rail Fence (Zigzag) Cipher implementation.
    
    The Rail Fence cipher is a form of transposition cipher that gets its name 
    from the way in which it is encoded. The plaintext is written downwards and 
    diagonally on successive "rails" of an imaginary fence, then moving up when 
    the bottom rail is reached. When the top rail is reached, the message is 
    written 
    until the whole plaintext is written out.
    """
    
    @staticmethod
    def transform(text, rails, encrypt=True):
        """
        Transform text using Rail Fence Cipher.
        
        Args:
            text (str): The text to encrypt or decrypt
            rails (int): Number of rails (rows) to use
            encrypt (bool): True for encryption, False for decryption
            
        Returns:
            str: The encrypted or decrypted text
        """
        if encrypt:
            return RailFenceCipher.encrypt(text, rails)
        else:
            return RailFenceCipher.decrypt(text, rails)
    
    @staticmethod
    def encrypt(text, rails):
        """
        Encrypt plaintext using Rail Fence Cipher.
        
        Args:
            text (str): Plaintext to encrypt
            rails (int): Number of rails (rows) to use
            
        Returns:
            str: Encrypted ciphertext
        """
        # Remove any spaces
        text = text.replace(" ", "")
        
        # Initialize the fence (rail matrix)
        fence = [[''] * len(text) for _ in range(rails)]
        
        # Populate the rail matrix with markers
        rail = 0
        direction = 1  # 1 for down, -1 for up
        
        for col in range(len(text)):
            # Place a marker in the current rail
            fence[rail][col] = text[col]
            
            # Change direction if we hit the top or bottom rail
            if rail == 0:
                direction = 1  # Moving down
            elif rail == rails - 1:
                direction = -1  # Moving up
                
            # Move to the next rail
            rail += direction
        
        # Read off the cipher text by row
        result = []
        for i in range(rails):
            for j in range(len(text)):
                if fence[i][j] != '':
                    result.append(fence[i][j])
        
        return ''.join(result)
    
    @staticmethod
    def decrypt(ciphertext, rails):
        """
        Decrypt ciphertext using Rail Fence Cipher.
        
        Args:
            ciphertext (str): Ciphertext to decrypt
            rails (int): Number of rails (rows) to use
            
        Returns:
            str: Decrypted plaintext
        """
        # Remove any spaces
        ciphertext = ciphertext.replace(" ", "")
        
        # Initialize the fence (rail matrix)
        fence = [['\n' for _ in range(len(ciphertext))] for _ in range(rails)]
        
        # First, mark the zigzag pattern with placeholders
        rail = 0
        direction = 1
        
        for col in range(len(ciphertext)):
            fence[rail][col] = '*'
            
            if rail == 0:
                direction = 1
            elif rail == rails - 1:
                direction = -1
                
            rail += direction
        
        # Now fill in the fence with the ciphertext characters
        index = 0
        for i in range(rails):
            for j in range(len(ciphertext)):
                if fence[i][j] == '*' and index < len(ciphertext):
                    fence[i][j] = ciphertext[index]
                    index += 1
        
        # Read the plaintext by following the zigzag pattern
        result = []
        rail = 0
        direction = 1
        
        for col in range(len(ciphertext)):
            result.append(fence[rail][col])
            
            if rail == 0:
                direction = 1
            elif rail == rails - 1:
                direction = -1
                
            rail += direction
        
        return ''.join(result)
