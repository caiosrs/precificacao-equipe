#precificacao/server.py
from fastapi import FastAPI
import pandas as pd
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/valores-cargos/")
async def obter_valores_cargos():
    ExcelPrecificacao = r'\\10.1.1.2\ti\BaseCalculos\PrecificacaoEquipe.xlsx'
    
    try:
        # Leia a aba específica da planilha
        df = pd.read_excel(ExcelPrecificacao, sheet_name='Equipe')
        
        # Substitua NaN por None
        df = df.where(pd.notnull(df), None)
        
        # Filtre linhas com cargos vazios ou inválidos
        df = df[df['Cargo'].notna() & (df['Cargo'] != 0)]
        
        # Converta valores numéricos para o formato desejado
        for col in df.select_dtypes(include=['float64']).columns:
            df[col] = df[col].apply(lambda x: round(x, 2) if pd.notnull(x) else None)
        
        # Converta o DataFrame para um dicionário
        data = df.to_dict(orient='records')
        
        # Retorne os dados como JSON
        return JSONResponse(content=data)
    
    except FileNotFoundError:
        return JSONResponse(content={"error": "Arquivo Excel não encontrado."}, status_code=404)
    except ValueError as e:
        return JSONResponse(content={"error": f"Erro ao ler o arquivo Excel: {str(e)}"}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
