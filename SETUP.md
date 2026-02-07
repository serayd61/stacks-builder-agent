# GitHub Secrets Setup Guide

Bu dokuman, Stacks Builder Agent'in calisabilmesi icin gerekli GitHub Secrets ayarlarini aciklar.

## Adim 1: GitHub Personal Access Token (PAT) Olusturma

1. GitHub'a giris yap: https://github.com
2. Settings > Developer settings > Personal access tokens > Tokens (classic)
3. "Generate new token (classic)" tikla
4. Token ayarlari:
   - **Note**: Stacks Builder Agent
   - **Expiration**: 90 days (veya istediginiz sure)
   - **Scopes** (bu kutulari sec):
     - [x] `repo` (Full control of private repositories)
     - [x] `workflow` (Update GitHub Action workflows)
     - [x] `write:packages` (optional, for npm packages)

5. "Generate token" tikla
6. **ONEMLI**: Token'i kopyala ve guvenli bir yerde sakla! Bir daha gosterilmeyecek.

## Adim 2: Repository'yi GitHub'a Push Et

```bash
# stacks-builder-agent icin
cd /Users/serkanaydin/stacks/stacks-builder-agent
git remote add origin https://github.com/serayd61/stacks-builder-agent.git
git push -u origin main

# stacks-analytics icin
cd /Users/serkanaydin/stacks/stacks-analytics
git remote add origin https://github.com/serayd61/stacks-analytics.git
git push -u origin main

# clarity-patterns icin
cd /Users/serkanaydin/stacks/clarity-patterns
git remote add origin https://github.com/serayd61/clarity-patterns.git
git push -u origin main

# stacks-testing-suite icin
cd /Users/serkanaydin/stacks/stacks-testing-suite
git remote add origin https://github.com/serayd61/stacks-testing-suite.git
git push -u origin main
```

## Adim 3: GitHub Secrets Ayarlama

1. GitHub'da `serayd61/stacks-builder-agent` repository'sine git
2. Settings > Secrets and variables > Actions
3. "New repository secret" tikla
4. Su secret'lari ekle:

### STACKS_PRIVATE_KEY
- **Name**: `STACKS_PRIVATE_KEY`
- **Secret**: Stacks wallet private key'iniz
- **Ornek**: `4c664d1c1c36f56063823b6a7cbc8185ab9bcd84d4b291500667bc7ad5e3054b01`

### GH_PAT
- **Name**: `GH_PAT`
- **Secret**: Adim 1'de olusturdugumuz Personal Access Token
- **Ornek**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### STACKS_ADDRESS
- **Name**: `STACKS_ADDRESS`
- **Secret**: STX adresiniz
- **Ornek**: `SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB`

## Adim 4: Workflow'u Test Et

1. Repository'de Actions sekmesine git
2. "Daily Builder Activity" workflow'unu sec
3. "Run workflow" tikla
4. Manual olarak calistir ve ciktiyi kontrol et

## Guvenlik Notlari

- Private key'inizi ASLA kod icinde veya commit'lerde paylasmay!
- GitHub Secrets sifrelidir ve guvenlidir
- Sadece minimum STX tutun (gas fees icin)
- Token'inizi duzenli olarak yenileyin (90 gun)

## Sorun Giderme

### "Permission denied" hatasi
- GH_PAT token'inizin `repo` ve `workflow` scope'larina sahip oldugundan emin olun

### "Insufficient balance" hatasi
- Wallet'inizda yeterli STX oldugundan emin olun (en az 1 STX)

### Workflow calismiyorsa
- Actions sekmesinde workflow'un aktif oldugunu kontrol edin
- Secrets'larin dogru ayarlandigini kontrol edin
