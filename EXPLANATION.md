# Explanation
*Note: This is unfinished. It takes a long time to write this much...*

Why do I feel the need to explain all of my decisions in coding this module? Because security is extremely important, so every decision made in the making of this module is important.

Another goal of mine is to further educate others on good security practices and to break through some security misconceptions

**Note**: This document is not sorted in any particular order. Maybe I'll sort it later

## Password hashing
Password hashing is an important part of keeping user's password secure. It allows you to store a users password as a hash (from which the original password can not be retrieved), meaning that even if a server were to be hacked, the hacker would not obtain the users password.

### How I hash
To hash a users password I use 2 different hashing algorithms: scrypt and PBKDF2. Each of them serves a different role in adding another layer of security.

#### Steps
When LU (Lock-Up) first receives a users password it is hashed with PBKDF2 and then with scrypt. Specific parameters are mentioned later.

#### PBKDF2
PBKDF2 is an older hashing algorithm that has been battle tested. I use this because it's not likely to have any vulnerabilities, and it's a part of the built-in crypto module in nodejs.

PBKDF2 does have some issues however, namely being that it does not have protection against ASIC and GPU bruteforcing.

In my configuration PBKDF2 acts as a backup to scrypt since I see it as a more dependable algorithm. If there were to ever be a vulnerability found in scrypt, user's hashes would still be secure because they were also hashed with PBKDF2.

When hashing with PBKDF2 I use a 32 bit salt generated with `crypto.randomBytes`, which is the best random generator you're gonna get in nodejs (it uses /dev/random). I also iterate PBKDF2 1000 times for added security.

The end result is a 512 bit hash. Then this hash is sent to scrypt.

#### Scrypt
Scrypt is a newer algorithm that is not only known to be secure, but also provides protection against ASIC and GPU brute force attacks.

In my configuration scrypt takes the PBKDF2 hash and rehashes it with a new salt (automatically provided by scrypt).