#!/usr/bin/env python3
"""
Cipher Tool - Graphical User Interface

A graphical application for encrypting and decrypting messages using 
various ciphers.
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from ciphers import (
    CaesarCipher,
    PolyalphabeticCipher,
    RailFenceCipher,
    SubstitutionCipher,
    TranspositionCipher,
    AffineCipher
)


class CipherToolGUI:
    """Main application class for the Cipher Tool GUI."""
    
    def __init__(self, root):
        """Initialize the application UI."""
        self.root = root
        self.root.title("Cipher Tool")
        self.root.geometry("600x500")
        self.root.minsize(550, 450)
        
        self.create_widgets()
        self.setup_layout()
    
    def create_widgets(self):
        """Create all the UI widgets."""
        # Frame for cipher selection and operation
        self.control_frame = ttk.LabelFrame(self.root, text="Cipher Controls")
        
        # Cipher type selection
        ttk.Label(self.control_frame, text="Cipher Type:").grid(
            row=0, column=0, sticky=tk.W, padx=5, pady=5
        )
        self.cipher_var = tk.StringVar()
        self.cipher_combo = ttk.Combobox(
            self.control_frame, 
            textvariable=self.cipher_var,
            state="readonly"
        )
        self.cipher_combo["values"] = [
            "Caesar",
            "Polyalphabetic",
            "Rail Fence",
            "Substitution",
            "Transposition",
            "Affine"
        ]
        self.cipher_combo.current(0)  # Default to Caesar
        self.cipher_combo.grid(row=0, column=1, sticky=tk.W, padx=5, pady=5)
        
        # Cipher key
        ttk.Label(self.control_frame, text="Key:").grid(
            row=1, column=0, sticky=tk.W, padx=5, pady=5
        )
        self.key_var = tk.StringVar()
        self.key_entry = ttk.Entry(
            self.control_frame, 
            textvariable=self.key_var,
            width=30
        )
        self.key_entry.grid(row=1, column=1, sticky=tk.W, padx=5, pady=5)
        
        # Key help text
        self.key_help = ttk.Label(
            self.control_frame, 
            text="For Caesar & Rail Fence: numeric key; "
                 "Affine: a,b format",
            wraplength=400,
            font=("", 8)
        )
        self.key_help.grid(row=2, column=0, columnspan=2, sticky=tk.W, padx=5)
        
        # Operation selection
        self.operation_var = tk.StringVar(value="encrypt")
        self.encrypt_radio = ttk.Radiobutton(
            self.control_frame,
            text="Encrypt",
            variable=self.operation_var,
            value="encrypt"
        )
        self.decrypt_radio = ttk.Radiobutton(
            self.control_frame,
            text="Decrypt",
            variable=self.operation_var,
            value="decrypt"
        )
        self.encrypt_radio.grid(row=3, column=0, sticky=tk.W, padx=5, pady=5)
        self.decrypt_radio.grid(row=3, column=1, sticky=tk.W, padx=5, pady=5)
        
        # Input text area
        self.input_frame = ttk.LabelFrame(self.root, text="Input Text")
        self.input_text = scrolledtext.ScrolledText(
            self.input_frame, 
            wrap=tk.WORD,
            width=50,
            height=6
        )
        self.input_text.pack(padx=5, pady=5, fill=tk.BOTH, expand=True)
        
        # Result text area
        self.result_frame = ttk.LabelFrame(self.root, text="Result")
        self.result_text = scrolledtext.ScrolledText(
            self.result_frame, 
            wrap=tk.WORD,
            width=50,
            height=6,
            state="disabled"
        )
        self.result_text.pack(padx=5, pady=5, fill=tk.BOTH, expand=True)
        
        # Process button
        self.process_button = ttk.Button(
            self.root,
            text="Process",
            command=self.process_text
        )
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_bar = ttk.Label(
            self.root, 
            textvariable=self.status_var,
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        self.status_var.set("Ready")
    
    def setup_layout(self):
        """Setup the layout of widgets."""
        # Set up grid layout
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(2, weight=1)
        self.root.rowconfigure(4, weight=1)
        
        # Place widgets
        self.control_frame.grid(
            row=0, column=0, padx=10, pady=10, sticky=tk.NSEW
        )
        self.input_frame.grid(
            row=2, column=0, padx=10, pady=5, sticky=tk.NSEW
        )
        self.process_button.grid(
            row=3, column=0, padx=10, pady=5
        )
        self.result_frame.grid(
            row=4, column=0, padx=10, pady=5, sticky=tk.NSEW
        )
        self.status_bar.grid(
            row=5, column=0, sticky=tk.EW
        )
    
    def process_text(self):
        """Process the input text using the selected cipher."""
        try:
            # Get inputs
            cipher_name = self.cipher_var.get().lower().replace(" ", "")
            key = self.key_var.get()
            text = self.input_text.get("1.0", tk.END).strip()
            encrypt = self.operation_var.get() == "encrypt"
            
            if not text:
                messagebox.showwarning(
                    "Warning", "Please enter some text to process."
                )
                return
            
            if not key:
                messagebox.showwarning(
                    "Warning", "Please enter a key."
                )
                return
            
            # Process with the selected cipher
            result = self.process_cipher(cipher_name, text, key, encrypt)
            
            # Update result
            self.result_text.config(state="normal")
            self.result_text.delete("1.0", tk.END)
            self.result_text.insert("1.0", result)
            self.result_text.config(state="disabled")
            
            # Update status
            operation = "Encryption" if encrypt else "Decryption"
            status_msg = f"{operation} complete."
            self.status_var.set(status_msg)
            
        except Exception as e:
            messagebox.showerror("Error", str(e))
            self.status_var.set(f"Error: {str(e)}")
    
    def process_cipher(self, cipher_name, text, key, encrypt=True):
        """Process text using the specified cipher."""
        cipher_map = {
            "caesar": CaesarCipher,
            "polyalphabetic": PolyalphabeticCipher,
            "railfence": RailFenceCipher,
            "substitution": SubstitutionCipher,
            "transposition": TranspositionCipher,
            "affine": AffineCipher
        }
        
        cipher_class = cipher_map.get(cipher_name.lower())
        if not cipher_class:
            raise ValueError(f"Unknown cipher: {cipher_name}")
        
        if cipher_name == "railfence":
            try:
                rails = int(key)
                return cipher_class.transform(text, rails, encrypt)
            except ValueError:
                raise ValueError(
                    "Rail Fence cipher requires a numeric key (number of rails)"
                )
        
        elif cipher_name == "caesar":
            try:
                shift = int(key)
                if encrypt:
                    return cipher_class.encrypt(text, shift)
                else:
                    return cipher_class.decrypt(text, shift)
            except ValueError:
                raise ValueError(
                    "Caesar cipher requires a numeric key (shift value)"
                )
        
        elif cipher_name == "affine":
            try:
                # Affine cipher typically uses two parameters (a, b)
                a, b = map(int, key.split(","))
                if encrypt:
                    return cipher_class.encrypt(text, a, b)
                else:
                    return cipher_class.decrypt(text, a, b)
            except ValueError:
                raise ValueError(
                    "Affine cipher requires key in format 'a,b' (e.g., '5,8')"
                )
        
        # Default handling for the other ciphers
        if encrypt:
            return cipher_class.encrypt(text, key)
        else:
            return cipher_class.decrypt(text, key)


def main():
    """Entry point for the graphical application."""
    root = tk.Tk()
    # Create the application instance (kept alive by mainloop)
    app = CipherToolGUI(root)  # noqa: F841
    root.mainloop()
    return 0


if __name__ == "__main__":
    main()
