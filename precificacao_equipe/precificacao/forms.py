from django import forms

class CargoForm(forms.Form):
    cargo = forms.CharField(label='Cargo', max_length=100)
    salario = forms.DecimalField(label='Salário', required=False, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    assistencia_medica = forms.DecimalField(label='Assistência Médica', required=False, initial=450.00, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    assistencia_odontologica = forms.DecimalField(label='Assistência Odontológica', required=False, initial=21.96, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    seguro = forms.DecimalField(label='Seguro', required=False, initial=7.27, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    vale_refeicao = forms.DecimalField(label='Vale Refeição', required=False, initial=605.00, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    vale_alimentacao = forms.DecimalField(label='Vale Alimentação', required=False, initial=0.00, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    vale_transporte = forms.DecimalField(label='Vale Transporte', required=False, initial=200.00, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    gym_pass = forms.DecimalField(label='Gym Pass', required=False, initial=14.73, widget=forms.TextInput(attrs={'readonly': 'readonly'}))
